/**
 * WordPress dependencies
 */
import { createBlock } from "@wordpress/blocks";

const transforms = {
	from: [
		{
			type: "enter",
			regExp: /^>>$/,
			transform: () => createBlock("createwithrani/superlist-item"),
		},
	],
};

export default transforms;
