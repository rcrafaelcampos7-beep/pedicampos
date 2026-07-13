import {
  getOrderTimeline,
  isOrderStepDone,
  normalizeOrderStatusForFulfillment,
  ORDER_STATUS,
} from "../../utils/orderStatus.js";

export function OrderTimeline({ status, fulfillment }) {
  const normalizedStatus = normalizeOrderStatusForFulfillment(status, fulfillment);
  const steps = normalizedStatus === ORDER_STATUS.CANCELED ? [ORDER_STATUS.CANCELED] : getOrderTimeline(fulfillment);

  return (
    <ol className={`timeline ${normalizedStatus === ORDER_STATUS.CANCELED ? "timeline-canceled" : ""}`.trim()}>
      {steps.map((step) => (
        <li key={step} className={isOrderStepDone(normalizedStatus, step, fulfillment) || normalizedStatus === step ? "done" : ""}>
          <span />
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}
