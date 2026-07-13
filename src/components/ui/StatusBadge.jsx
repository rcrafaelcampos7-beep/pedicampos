import { normalizeOrderStatusForFulfillment, statusTone } from "../../utils/orderStatus.js";
import { Badge } from "./Badge.jsx";

export function StatusBadge({ status, fulfillment }) {
  const displayStatus = fulfillment ? normalizeOrderStatusForFulfillment(status, fulfillment) : status;
  return <Badge tone={statusTone(displayStatus)}>{displayStatus}</Badge>;
}
