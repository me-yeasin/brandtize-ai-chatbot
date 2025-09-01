"use client";
import { memo } from "react";

interface ChatLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ChatLoading = ({ size = "md", className = "" }: ChatLoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 384"
          className="w-full h-full"
        >
          <defs>
            <clipPath id="86f092377b">
              <path
                d="M 2.398438 2.398438 L 381.898438 2.398438 L 381.898438 381.898438 L 2.398438 381.898438 Z M 2.398438 2.398438 "
                clipRule="nonzero"
              />
            </clipPath>
          </defs>
          <g clipPath="url(#86f092377b)">
            <path
              fill="currentColor"
              d="M 192.148438 2.398438 C 296.945312 2.398438 381.898438 87.355469 381.898438 192.148438 C 381.898438 296.945312 296.945312 381.898438 192.148438 381.898438 C 87.355469 381.898438 2.398438 296.945312 2.398438 192.148438 C 2.398438 87.355469 87.355469 2.398438 192.148438 2.398438 Z M 149.410156 172.070312 L 90.949219 172.070312 L 90.949219 222.300781 C 90.949219 282.40625 139.589844 331.300781 199.375 331.300781 C 259.164062 331.300781 307.808594 282.40625 307.808594 222.300781 C 307.808594 162.195312 259.164062 113.296875 199.375 113.292969 L 149.410156 113.292969 Z M 199.375 172.070312 C 226.929688 172.070312 249.347656 194.601562 249.347656 222.300781 C 249.347656 249.996094 226.929688 272.527344 199.375 272.53125 C 171.824219 272.53125 149.410156 249.996094 149.410156 222.300781 L 149.410156 172.070312 Z M 90.949219 53 L 90.949219 113.292969 L 149.410156 113.292969 L 149.410156 53 Z M 90.949219 53 "
              fillRule="nonzero"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default memo(ChatLoading);
