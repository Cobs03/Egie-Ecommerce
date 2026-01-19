import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Printer, Eye } from "lucide-react";
import { UserOrderService } from "../../../services/UserOrderService";
import { getImageUrl } from "../../../lib/supabase";
import { useWebsiteSettings } from "../../../hooks/useWebsiteSettings";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Receipt = ({ orderId, orderNumber, isOpen, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useWebsiteSettings();

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await UserOrderService.getOrderById(orderId);
      
      if (error || !data) {
        toast.error("Failed to load receipt details");
        return;
      }
      
      setOrder(data);
    } catch (error) {
      console.error("Error loading receipt:", error);
      toast.error("Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...");
      const receiptElement = document.getElementById("receipt-content");
      
      // Capture the receipt as canvas
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Receipt-${orderNumber || orderId}.pdf`);
      
      toast.dismiss();
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cod: "Cash on Delivery",
      gcash: "GCash",
      card: "Credit/Debit Card",
    };
    return methods[method?.toLowerCase()] || method || "N/A";
  };

  const getDeliveryTypeLabel = (type) => {
    const types = {
      delivery: "Home Delivery",
      pickup: "Store Pickup",
      store_pickup: "Store Pickup",
      local_delivery: "Local Delivery",
    };
    // Auto-format unknown types: replace underscores and capitalize
    return types[type?.toLowerCase()] || type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "N/A";
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-full print:shadow-none z-[100] bg-white">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-2xl font-['Bruno_Ace_SC']">
              Order Receipt
            </DialogTitle>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Receipt Content */}
          <div id="receipt-content" className="bg-white p-4">
            {/* Header */}
            <div className="text-center mb-3 pb-2 border-b border-gray-300">
              <h1 className="text-xl font-bold font-['Bruno_Ace_SC'] mb-1">
                {settings?.brandName || "Egie GameShop"}
              </h1>
              <p className="text-xs text-gray-600">{settings?.contactAddress} | {settings?.contactPhone} | {settings?.contactEmail}</p>
            </div>

            {/* Receipt Info */}
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Order: <span className="font-bold">{order?.order_number}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Date: <span className="font-semibold">{formatDate(order?.created_at)}</span></p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-3 pb-2 border-b border-gray-200">
              <h3 className="font-bold text-sm mb-1">Customer Information</h3>
              <div className="text-xs space-y-0.5">
                <p>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span className="font-semibold">
                    {order?.shipping_addresses?.full_name || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{" "}
                  <span className="font-semibold">
                    {order?.shipping_addresses?.email || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Phone:</span>{" "}
                  <span className="font-semibold">
                    {order?.shipping_addresses?.phone || "N/A"}
                  </span>
                </p>
                {order?.delivery_type !== "pickup" && order?.delivery_type !== "store_pickup" && (
                  <p>
                    <span className="text-gray-600">Shipping Address:</span>{" "}
                    <span className="font-semibold">
                      {order?.shipping_addresses?.street_address},{" "}
                      {order?.shipping_addresses?.barangay},{" "}
                      {order?.shipping_addresses?.city},{" "}
                      {order?.shipping_addresses?.province},{" "}
                      {order?.shipping_addresses?.postal_code}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-3">
              <h3 className="font-bold text-sm mb-1">Order Items</h3>
              <table className="w-full text-xs">
                <thead className="border-b border-gray-300">
                  <tr>
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.order_items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-1">
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-gray-600">
                              Variant: {item.variant_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">
                        ₱{Number(item.unit_price).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-right py-1 font-semibold">
                        ₱{Number(item.total).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="mb-3 pb-2 border-b border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      ₱{Number(order?.subtotal || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee:</span>
                    <span className="font-semibold">
                      ₱{Number(order?.shipping_fee || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {order?.voucher_discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher Discount:</span>
                      <span className="font-semibold">
                        -₱{Number(order?.voucher_discount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {order?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">
                        -₱{Number(order?.discount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-gray-300 text-sm">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-green-600">
                      ₱{(() => {
                        // Calculate total: subtotal + shipping - discounts
                        const subtotal = Number(order?.subtotal) || 0;
                        const shipping = Number(order?.shipping_fee) || 0;
                        const voucherDiscount = Number(order?.voucher_discount) || 0;
                        const discount = Number(order?.discount) || 0;
                        const calculatedTotal = subtotal + shipping - voucherDiscount - discount;
                        // Use total_amount if it exists and is valid, otherwise use calculated
                        const finalTotal = (Number(order?.total_amount) > 0) ? Number(order?.total_amount) : calculatedTotal;
                        return finalTotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Delivery Info */}
            <div className="mb-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">
                  {getPaymentMethodLabel(order?.payments?.[0]?.payment_method)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Type:</span>
                <span className="font-semibold">
                  {getDeliveryTypeLabel(order?.delivery_type)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-semibold capitalize">
                  {order?.status?.replace("_", " ")}
                </span>
              </div>
              {order?.payments?.[0]?.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-semibold text-xs">
                    {order?.payments?.[0]?.transaction_id}
                  </span>
                </div>
              )}
            </div>

            {/* Customer Notes */}
            {order?.customer_notes && (
              <div className="mb-2 pb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs mb-1">Customer Notes:</h3>
                <p className="text-xs text-gray-600 italic">
                  {order.customer_notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-2 pt-2 border-t border-gray-300">
              <p className="text-xs text-gray-600">Thank you for shopping with us!</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                For inquiries: {settings?.contactPhone} | {settings?.contactEmail}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {settings?.footerText || "© 2026 Egie GameShop. All rights reserved."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Receipt;
