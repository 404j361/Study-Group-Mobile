import React from "react";
import Svg, { Path } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};
export default function SettingIcon({ width, height, color }: IconProps) {
    return (
        <Svg
            width={width || 48}
            height={height || 48}
            viewBox="0 0 48 48"
            fill="none"
        >
            <Path
                d="M20 12.4C20 8.6 17.6 5.2 14 4V11.4H8V4C4.4 5.2 2 8.6 2 12.4C2 16.2 4.4 19.6 8 20.8V42.8C8 43.6 8.4 44 9 44H13C13.6 44 14 43.6 14 43V21C17.6 19.8 20 16.4 20 12.4ZM32 16C24.2 16.2 18 22.4 18 30C18 37.8 24.2 44 32 44C39.8 44 46 37.8 46 30C46 22.2 39.8 16 32 16ZM32 40C26.4 40 22 35.6 22 30C22 24.4 26.4 20 32 20C37.6 20 42 24.4 42 30C42 35.6 37.6 40 32 40ZM30 22V32L37.2 36.4L38.8 34L33 30.6V22H30Z"
                fill={color}
            />
        </Svg>
    );
}
