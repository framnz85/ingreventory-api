const { Xendit } = require("xendit-node");

exports.createInvoice = async (req, res) => {
  try {
    const { orderId, amount, customer, secretKey } = req.body;
    if (!orderId || !amount || !customer || !customer.email || !secretKey) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const xendit = new Xendit({
      secretKey: secretKey,
    });

    const { Invoice } = xendit;

    const invoice = await Invoice.createInvoice({
      externalID: `order-${orderId}-${Date.now()}`,
      amount,
      payerEmail: customer.email,
      description: `Payment for Order #${orderId}`,
      customer: {
        given_names: customer.name,
        email: customer.email,
      },
      successRedirectURL: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/payment-success?orderId=${orderId}`,
      failureRedirectURL: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/payment-failed?orderId=${orderId}`,
    });

    res.json({ success: true, invoice_url: invoice.invoice_url });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create Xendit invoice",
      error: error.message,
    });
  }
};
