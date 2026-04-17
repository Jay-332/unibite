import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasRealKeys =
      Boolean(keyId && keySecret) &&
      keyId !== "rzp_test_placeholder" &&
      keySecret !== "secret_placeholder";

    // Allow local testing without live Razorpay credentials.
    if (!hasRealKeys) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          id: `dev_order_${Date.now()}`,
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          isMock: true,
        });
      }

      return NextResponse.json(
        { error: "Razorpay is not configured on the server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
