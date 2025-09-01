import { memo } from "react";

import BrandIcon from "@/assets/icons/brand_icon";

const WelcomeMessage = () => {
  return (
    <div className="text-center mb-12">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
        <BrandIcon />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        How can I help you today?
      </h2>
      <p className="text-gray-300">
        I can assist with coding, writing, analysis, math, and much more.
      </p>
    </div>
  );
};

export default memo(WelcomeMessage);
