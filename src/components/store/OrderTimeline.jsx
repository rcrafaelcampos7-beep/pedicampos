import { isOrderStepDone, ORDER_STATUS, ORDER_TIMELINE } from "../../utils/orderStatus.js";

export function OrderTimeline({ status }) {
  const steps = status === ORDER_STATUS.CANCELED ? [ORDER_STATUS.CANCELED] : ORDER_TIMELINE;

  return (
    <ol className={`timeline ${status === ORDER_STATUS.CANCELED ? "timeline-canceled" : ""}`.trim()}>
      {steps.map((step) => (
        <li key={step} className={isOrderStepDone(status, step) || status === step ? "done" : ""}>
          <span />
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}
