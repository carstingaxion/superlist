/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import {
	useBlockProps,
	InnerBlocks,
	BlockControls,
	// __experimentalUseInnerBlocksProps as useInnerBlocksProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	InspectorControls,
	useSetting,
	BlockVerticalAlignmentToolbar,
} from "@wordpress/block-editor";
import {
	PanelBody,
	PanelRow,
	__experimentalUnitControl as UnitControl,
	Button,
} from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";
import { createBlock } from "@wordpress/blocks";
/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./editor.scss";
import ListStyleUI from "./list-style";
import { Orientation } from "./orientation";

/**
 * Internal Dependencies
 */
const ALLOWED_BLOCKS = ["createwithrani/superlist-item"];
const LIST_TEMPLATE = [
	["createwithrani/superlist-item"],
	// ["createwithrani/superlist-item"],
];

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit(props) {
	const { attributes, setAttributes, clientId, isSelected } = props;
	const { listStyle, orientation, itemWidth, verticalAlignment } = attributes;
	console.log(isSelected);
	// check if theme.json has set a preferred list orientation
	const themeListOrientation = useSetting(
		"custom.superlist-block.listSettings.orientation"
	);

	// set the default list orientation to theme.json preference but if there's no theme.json preference, set it to vertical
	const defaultListOrientation =
		undefined === themeListOrientation ? "vertical" : themeListOrientation;

	// set up a state variable for list orientation, use the orientation attribute if it is set, otherwise  use the smart default
	const [listOrientation, setListOrientation] = useState(
		undefined !== orientation ? orientation : defaultListOrientation
	);

	const [width, setWidth] = useState(itemWidth);

	const subItemWidth = {
		"--wp--custom--superlist-block--list-settings--width": width,
	};
	const blockProps = useBlockProps({
		className: classnames(listStyle, listOrientation, {
			[`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
		}),
		style: "horizontal" === listOrientation ? subItemWidth : {},
	});
	const { insertBlock } = useDispatch("core/block-editor");
	const { innerBlocks } = useSelect((select) => ({
		innerBlocks: select("core/block-editor").getBlocks(clientId),
	}));
	const insertListItem = () => {
		const block = createBlock("createwithrani/superlist-item");
		insertBlock(block, innerBlocks.length, clientId);
	};
	const ListItemAppender = () => (
		<Button
			isSecondary
			className="superlist-block-appender"
			onClick={insertListItem}
		>
			{__("Add a Super List Item", "superlist-block")}
		</Button>
	);
	const innerBlockProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: LIST_TEMPLATE,
		orientation: `${listOrientation}`,
		templateInsertUpdatesSelection: true,
		renderAppender: ListItemAppender,
	});
	function switchStyle(style) {
		setAttributes({ listStyle: style });
	}
	function setItemWidth(value) {
		setWidth(value);
		setAttributes({ itemWidth: value });
	}
	function updateAlignment(verticalAlignment) {
		setAttributes({ verticalAlignment: verticalAlignment });
	}
	function updateOrientation(orientation) {
		setListOrientation(orientation);
		setAttributes({ orientation: orientation });
	}
	const ListContainer = "none" !== listStyle ? listStyle : "div";

	const { selectBlock } = useDispatch(blockEditorStore);
	const { descendantClientId } = useSelect((select) => {
		const { getClientIdsOfDescendants, getBlock } = select(blockEditorStore);
		const descendantClientIds = getClientIdsOfDescendants([clientId]);
		console.log(descendantClientIds);
		const emptyParagraph = descendantClientIds
			? getBlock(descendantClientIds[1])
			: null;

		return {
			descendantClientId: emptyParagraph ? emptyParagraph : null,
		};
	}, []);

	// if (
	// 	descendantClientId &&
	// 	"core/paragraph" === descendantClientId.name &&
	// 	"" === descendantClientId.attributes.content &&
	// 	isSelected
	// ) {
	// 	selectBlock(descendantClientId.clientId);
	// 	console.log("hi");
	// }

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					onChange={updateAlignment}
					value={verticalAlignment}
				/>
				<ListStyleUI
					value={listStyle}
					onChange={switchStyle}
					placement="toolbar"
				/>
				<Orientation
					listOrientation={listOrientation}
					updateOrientation={updateOrientation}
					placement="toolbar"
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					initialOpen={true}
					title={__("List Settings", "superlist-block")}
				>
					{listOrientation === "horizontal" && (
						<PanelRow>
							<UnitControl
								label={__("List-item max-width", "superlist-block")}
								onChange={setItemWidth}
								value={width}
							/>
						</PanelRow>
					)}
					<br />
					<PanelRow>
						<ListStyleUI
							value={listStyle}
							onChange={switchStyle}
							placement="inspector"
						/>
					</PanelRow>
					<PanelRow>
						<Orientation
							listOrientation={listOrientation}
							updateOrientation={updateOrientation}
							placement="inspector"
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<ListContainer {...innerBlockProps} />
		</>
	);
}
