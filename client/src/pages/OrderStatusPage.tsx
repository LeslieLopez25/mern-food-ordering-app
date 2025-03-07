import { useEffect, useState } from "react";
import { useGetMyOrders } from "@/api/OrderApi";
import OrderStatusDetail from "@/components/OrderStatusDetail";
import OrderStatusHeader from "@/components/OrderStatusHeader";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Order } from "@/types";
import { useArchiveOrder } from "@/api/OrderApi";

const OrderStatusPage = () => {
  const { orders, isLoading } = useGetMyOrders();
  const { archiveOrder } = useArchiveOrder();
  const [visibleOrders, setVisibleOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!orders) return;

    // Keep track of new orders (prevents overwriting previous ones)
    setVisibleOrders((prev) => {
      const newOrders = orders.filter(
        (o) => !prev.some((po) => po._id === o._id)
      );
      return [...prev, ...newOrders];
    });

    // Find new delivered orders that haven't been scheduled for archiving yet
    orders.forEach((order) => {
      if (order.status === "delivered" && !deliveredOrders.has(order._id)) {
        setDeliveredOrders((prev) => new Set(prev).add(order._id));

        // Delay the archive process for new delivered orders
        const timer = setTimeout(() => {
          archiveOrder(order._id);

          setDeliveredOrders((prev) => {
            const newSet = new Set(prev);
            newSet.delete(order._id);
            return newSet;
          });

          // Remove the order from UI **only if it's still in delivered state**
          setVisibleOrders((prevOrders) =>
            prevOrders.filter((o) => o._id !== order._id)
          );
        }, 5000);

        // Cleanup the timeout when the component unmounts or if order changes
        return () => clearTimeout(timer);
      }
    });
  }, [orders, archiveOrder, deliveredOrders]); // ✅ Only runs when `orders` change

  if (isLoading) {
    return "Loading...";
  }

  if (!visibleOrders || visibleOrders.length === 0) {
    return "No active orders";
  }

  return (
    <div className="space-y-10">
      {visibleOrders.map((order) => (
        <div key={order._id} className="space-y-10 bg-gray-50 p-10 rounded-lg">
          <OrderStatusHeader order={order} />
          <div className="grid gap-10 md:grid-cols-2">
            <OrderStatusDetail order={order} />
            <AspectRatio ratio={16 / 5}>
              <img
                src={order.restaurant.imageUrl}
                className="rounded-md object-cover h-full w-full"
                alt=""
              />
            </AspectRatio>
          </div>
          {order.status === "delivered" && (
            <p className="text-green-500 font-bold text-center">Delivered</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStatusPage;
