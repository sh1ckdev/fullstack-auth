import { observer } from "mobx-react-lite";
import { authStore } from "../stores/authStore";
import { UserIcon, AtSymbolIcon } from "@heroicons/react/24/outline";

const Profile = observer(() => {
  return (
    <div className="min-h-max flex items-center justify-center">
      <div className="relative z-10 bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-md w-full border border-white/30">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Личная информация</h2>

        <div className="flex flex-col space-y-4">
          {/* Имя пользователя */}
          <div className="flex items-center text-gray-300">
            <UserIcon className="h-6 w-6 mr-2 text-blue-500" />
            <span className="font-medium mr-2">Имя пользователя:</span>
            <span className="transform hover:-translate-y-0.5 transition duration-300">
              {authStore.user.username}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center text-gray-300">
            <AtSymbolIcon className="h-6 w-6 mr-2 text-blue-500" />
            <span className="font-medium mr-2">Email:</span>
            <span className="transform hover:-translate-y-0.5 transition duration-300">
              {authStore.user.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Profile;