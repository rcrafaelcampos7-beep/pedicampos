import { lazy } from "react";

export function lazyNamed(loader, exportName) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] };
  });
}
