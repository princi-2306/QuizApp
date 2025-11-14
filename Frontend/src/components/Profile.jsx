import React from 'react'

const Profile = () => {
  return (
    <div className="w-100 bg-purple-300 rounded-xl p-4 flex flex-col items-center">
      <div className="h-40 w-40 rounded-full bg-gray-600">
        <img className="h-40 w-40 rounded-full" src={img} alt="" />
      </div>
    </div>
  );
}

export default Profile
