import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LoadingPage = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-purple-900">
      <div className='flex flex-col justify-center items-center'>
        <DotLottieReact
          src="https://lottie.host/0cf6b556-094e-4c6a-a9aa-acd38e9687ca/P45baCyCKV.lottie"
          loop
          autoplay
          style={{ width: '300px', height: '300px' }}
        />
        <p className="text-white text-lg font-medium mt-4 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default LoadingPage