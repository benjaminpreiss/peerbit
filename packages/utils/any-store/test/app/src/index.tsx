import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryLevel } from "memory-level";
import { createStore } from "@peerbit/any-store";

/* import { expect } from '@jest/globals'; */
/* expect(1).toEqual(1) */
(window as any)["create"] = async (type: "disc" | "memory") => {
	const store = createStore(
		type === "disc" ? "./tmp/" + (+new Date()).toString() : undefined
	);
	await store.open();
	(window as any)["store"] = store;
};

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<React.StrictMode>
		ß<>Hello</>
	</React.StrictMode>
);
