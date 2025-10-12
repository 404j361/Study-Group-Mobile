import React from "react";
import Svg, { Path } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};

export default function ProfilesIcon({ width, height, color }: IconProps) {
    return (
        <Svg
            width={width || 48}
            height={height || 48}
            viewBox="0 0 48 48"
            fill="none"
        >
            <Path
                d="M34 42V38C34 35.8783 33.1571 33.8434 31.6569 32.3431C30.1566 30.8429 28.1217 30 26 30H10C7.87827 30 5.84344 30.8429 4.34315 32.3431C2.84285 33.8434 2 35.8783 2 38V42"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M18 22C22.4183 22 26 18.4183 26 14C26 9.58172 22.4183 6 18 6C13.5817 6 10 9.58172 10 14C10 18.4183 13.5817 22 18 22Z"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M46 41.9998V37.9998C45.9987 36.2272 45.4087 34.5053 44.3227 33.1044C43.2368 31.7035 41.7163 30.7029 40 30.2598"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M32 6.25977C33.7208 6.70037 35.2461 7.70117 36.3353 9.10439C37.4245 10.5076 38.0157 12.2334 38.0157 14.0098C38.0157 15.7861 37.4245 17.5119 36.3353 18.9151C35.2461 20.3184 33.7208 21.3192 32 21.7598"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
