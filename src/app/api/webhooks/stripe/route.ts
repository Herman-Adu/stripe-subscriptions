import prisma from "@/db/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();

    const sig = req.headers.get("stripe-signature")!;

	let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);        
    } catch (error: any) {
        console.error("Webhook signature verification failed.", error.message);
		return new Response(`Webhook Error: ${error.message}`, { status: 400 });        
    }

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                
                const session = await stripe.checkout.sessions.retrieve(
					(event.data.object as Stripe.Checkout.Session).id,
					{
						expand: ["line_items"],
					}
				);

                // get customerId, customerDetails and line item from the session
                const customerId = session.customer as string;
                const customerDetails = session.customer_details as Stripe.Checkout.Session.CustomerDetails;
                const lineItems = session.line_items?.data || [];

                // check for a customer email
                if (customerDetails?.email) {

                    // get the user associated with the email
                    const user = await prisma.user.findUnique({
                        where: { email: customerDetails.email },
                    });
                    
                    // no  user
					if (!user) throw new Error("User not found");

                    // bind the customer Id to the user comming from stripe
                    // This will be important to delete the user's subscription
                    if (!user.customerId) {
						await prisma.user.update({
							where: { id: user.id },
							data: { customerId },
						});
					}                    

                    // loop through the line items
                    for (const item of lineItems) {
                        // extract the price id
                        const priceId = item.price?.id;

                        // check if is subscription or not
                        const isSubscription = item.price?.type === "recurring";

                        if (isSubscription) {
                            
                            let endDate = new Date();

                            // calculate the end date for monthly & yearly plan
                            if (priceId === process.env.STRIPE_YEARLY_PRICE_ID!) {
								endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
							} else if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID!) {
								endDate.setMonth(endDate.getMonth() + 1); // 1 month from now
							} else {
								throw new Error("Invalid priceId");
							}
                            
                            // The upsert operation is a combination of update and insert. It allows you to update an existing record or creat a new one if it dosen't
                            // Create the subscription if one does not exist already, but if it exists, update it.
                            await prisma.subscription.upsert({
                                where: {userId: user.id!},
                                create: {
									userId: user.id,
									startDate: new Date(),
									endDate: endDate,
									plan: "premium",
									period: priceId === process.env.STRIPE_YEARLY_PRICE_ID! ? "yearly" : "monthly",
								},
                                update: {
									plan: "premium",
									period: priceId === process.env.STRIPE_YEARLY_PRICE_ID! ? "yearly" : "monthly",
									startDate: new Date(),
									endDate: endDate,
								},
                            });

                            // update the plan field in the user table
                            await prisma.user.update({
								where: { id: user.id },
								data: { plan: "premium" },
							});

                        } else {
                            // Todo - handle one time purchase
                        }
                    }
                }                           
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id);
                //console.log("Subscription: ", subscription)

                const user = await prisma.user.findUnique({
                    where: { customerId: subscription.customer as string },
                });

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { plan: "free" },
                    });
                } else {
                    console.error("User not found for the subscription deleted event.");
                    throw new Error("User not found for the subscription deleted event.");
                }    
                break;
            }

            default:
            console.warn(`Unhandled event type ${event.type}`);
        }
        
    } catch (error) {
		console.error("Error handling event", error);
		return new Response("Webhook Error", { status: 400 });
	}

    return new Response("Webhook received", { status: 200 });
}