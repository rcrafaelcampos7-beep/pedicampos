import { statusTone } from "../../utils/orderStatus.js";
import { Badge } from "./Badge.jsx";

export function StatusBadge({ status }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}
