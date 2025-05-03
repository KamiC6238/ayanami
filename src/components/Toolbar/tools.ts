import BroomIconSrc from "@/assets/icons/broom.png";
import BucketIconSrc from "@/assets/icons/bucket.png";
import CircleIconSrc from "@/assets/icons/circle.png";
import EllipsisCircleIconSrc from "@/assets/icons/ellipsis.png";
import EraserIconSrc from "@/assets/icons/eraser.png";
import LineIconSrc from "@/assets/icons/line.png";
import PencilIconSrc from "@/assets/icons/pencil.png";
import SquareIconSrc from "@/assets/icons/square.png";
import { ToolTypeEnum } from "@/types";

export default [
	{
		url: PencilIconSrc,
		type: ToolTypeEnum.Pencil,
	},
	{
		url: EraserIconSrc,
		type: ToolTypeEnum.Eraser,
	},
	{
		url: BucketIconSrc,
		type: ToolTypeEnum.Bucket,
	},
	{
		url: LineIconSrc,
		type: ToolTypeEnum.Line,
	},
	{
		url: CircleIconSrc,
		type: ToolTypeEnum.Circle,
	},
	{
		url: EllipsisCircleIconSrc,
		type: ToolTypeEnum.Ellipse,
	},
	{
		url: SquareIconSrc,
		type: ToolTypeEnum.Square,
	},
	{
		url: BroomIconSrc,
		type: ToolTypeEnum.Broom,
	},
];
