const Cashflow = require("../models/Cashflow");

exports.addCashflow = async (req, res) => {
  try {
    const { type, amount, note, userId, storeId } = req.body;
    const cashflow = new Cashflow({ type, amount, note, userId, storeId });
    await cashflow.save();
    res.status(201).json({ success: true, data: cashflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add cashflow",
      error: error.message,
    });
  }
};

exports.getSalesSummary = async (req, res) => {
  try {
    const { storeId, start, end } = req.query;
    const startDate = start
      ? new Date(start)
      : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = end ? new Date(end) : new Date();

    // Get orders for the period
    const Order = require("../models/Order");
    const orders = await Order.find({
      storeId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get cashflows for the period
    const cashflows = await Cashflow.find({
      storeId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate totals
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

    // Calculate total cost including addons for each item in each order
    const totalCost = orders.reduce((cost, o) => {
      if (o.totalCost) {
        return cost + o.totalCost;
      } else {
        return 0;
      }
    }, 0);

    console.log(totalCost);

    const cashIn = cashflows
      .filter((f) => f.type === "in")
      .reduce((sum, f) => sum + f.amount, 0);
    const cashOut = cashflows
      .filter((f) => f.type === "out")
      .reduce((sum, f) => sum + f.amount, 0);

    res.json({
      success: true,
      data: {
        orders,
        cashflows,
        summary: {
          totalSales,
          totalCost, // <-- Added total cost
          cashIn,
          cashOut,
          net: totalSales + cashIn - cashOut,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get sales summary",
      error: error.message,
    });
  }
};
