const purchaseData = [
  {
    id: 1,
    status: "To Ship",
    subStatus: "Preparing Parts",
    note: "Delivery attempt should be completed at 5/11/2024 and 5/21/2024",
    cancelReason: "",
    products: [
      {
        title: "Hydraulic Gear Pump System",
        quantity: 1,
        price: "45,000",
        total: "45,000",
      },
      {
        title: "Valve Kit",
        quantity: 1,
        price: "15,000",
        total: "15,000",
      },
    ],
  },
  {
    id: 2,
    status: "Completed",
    subStatus: "Store Pick-up Complete",
    cancelReason: "",
    products: [
      {
        title: "Excavator Hose Kit",
        quantity: 2,
        price: "25,000",
        total: "50,000",
      },
    ],
  },
  {
    id: 3,
    status: "Cancelled",
    subStatus: "Cancelled by you",
    cancelReason: "Reset Password",
    products: [
      {
        title: "Mechanical Seal Kit",
        quantity: 1,
        price: "10,000",
        total: "10,000",
      },
    ],
  },
  {
    id: 4,
    status: "Store Pick-up",
    subStatus: "Waiting for your arrival",
    note: "Order will be ready at 05/26/2025. Please come to the store to pick up your order.",
    cancelReason: "",
    products: [
      {
        title: "Bulldozer Blade Assembly",
        quantity: 1,
        price: "60,000",
        total: "60,000",
      },
    ],
  },
  {
    id: 5,
    status: "To Receive",
    subStatus: "Order coming",
    note: "Delivery attempt should be coming at your address.",
    cancelReason: "",
    products: [
      {
        title: "Backhoe Bucket Teeth",
        quantity: 5,
        price: "3,000",
        total: "15,000",
      },
    ],
  },
  // Additional sample orders
  {
    id: 6,
    status: "To Ship",
    subStatus: "Packing",
    note: "Expected to ship by 6/10/2024.",
    cancelReason: "",
    products: [
      {
        title: "Excavator Track Roller",
        quantity: 2,
        price: "20,000",
        total: "40,000",
      },
      {
        title: "Hydraulic Filter",
        quantity: 3,
        price: "2,000",
        total: "6,000",
      },
    ],
  },
  {
    id: 7,
    status: "Completed",
    subStatus: "Delivered",
    cancelReason: "",
    products: [
      {
        title: "Loader Bucket",
        quantity: 1,
        price: "30,000",
        total: "30,000",
      },
      {
        title: "Quick Coupler",
        quantity: 1,
        price: "12,000",
        total: "12,000",
      },
    ],
  },
  {
    id: 8,
    status: "Cancelled",
    subStatus: "Cancelled by you",
    cancelReason: "Found a better price elsewhere",
    products: [
      {
        title: "Dozer Track Chain",
        quantity: 1,
        price: "55,000",
        total: "55,000",
      },
    ],
  },
  {
    id: 9,
    status: "To Receive",
    subStatus: "Order coming",
    note: "Expected delivery by 6/15/2024.",
    cancelReason: "",
    products: [
      {
        title: "Hydraulic Cylinder",
        quantity: 2,
        price: "18,000",
        total: "36,000",
      },
    ],
  },
];

export default purchaseData;
