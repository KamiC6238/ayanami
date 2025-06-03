export type Frame = {
	snapshot: string;
};

export type FramesMap = Record<string, Frame>;

export type Frames = {
	frames: FramesMap;
};
