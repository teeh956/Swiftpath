export const users = [
  {
    id: "merchant_1",
    email: "merchant@swiftpath.ke",
    password: "password123",
    name: "Zawadi Boutique",
    role: "merchant"
  }
];

export const shipments = [
  {
    id: "SWP-2025-847291",
    merchantId: "merchant_1",
    customer: {
      name: "Wanjiku Kamau",
      phone: "+254712345678",
      geoAddress: "SW-NRB-4829",
      estate: "Kilimani"
    },
    parcel: {
      description: "Ladies Dress (Blue, Size M)",
      category: "Fashion",
      weight: 1.4,
      value: 2400,
      fragile: false,
      highValue: false
    },
    status: "in_transit",
    eta: "2025-05-26T14:45:00Z",
    rider: {
      name: "Kamau J.",
      rating: 4.9,
      location: { lat: -1.2921, lng: 36.8219 }
    },
    createdAt: "2025-05-25T10:02:00Z",
    updatedAt: "2025-05-25T11:30:00Z",
    codAmount: 2400,
    serviceTier: "express",
    paymentMethod: "cod"
  }
];

export const pataPoints = [
  {
    id: "pata_1",
    name: "Mama Njeri's Pharmacy",
    estate: "Westlands",
    phone: "+254700000001",
    earningsToday: 840,
    parcels: [
      {
        id: "SWP-2025-112233",
        customer: "Mercy Akinyi",
        phone: "+254778901234",
        arrived: "09:42 AM",
        pin: "7823",
        collected: false
      }
    ]
  }
];

export const analytics = {
  summary: {
    totalParcels: 1032,
    successRate: 98.2,
    avgDeliveryTime: 87,
    revenue: 309600,
    codCollected: 2100000,
    failedDeliveries: 19
  },
  volume: Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, parcels: Math.floor(80 + Math.random() * 80), success: +(94 + Math.random() * 4.5).toFixed(1) })),
  zones: [
    { zone: "Westlands", parcels: 312 },
    { zone: "Kilimani", parcels: 287 },
    { zone: "Kasarani", parcels: 245 }
  ],
  revenue: [
    { month: "Jan", revenue: 800000, cost: 320000 },
    { month: "Feb", revenue: 920000, cost: 340000 },
    { month: "Mar", revenue: 830000, cost: 310000 }
  ]
};
