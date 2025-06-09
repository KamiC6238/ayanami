export type Frame = {
	snapshot?: string;
	isCopiedFrame?: boolean;
	sourceFrameId?: string;
	sourceFrameChain?: string[];
	copyTimestamp?: number; // Timestamp when frame was copied
	sourceFrameTimestamps?: Record<string, number>; // Timestamp limits for each dependency frame
};

export type FramesMap = Record<string, Frame>;

export type Frames = {
	frames: FramesMap;
};
