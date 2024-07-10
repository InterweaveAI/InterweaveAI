import { useEffect, useState } from "react";
import { createDataItemSigner, message } from "@permaweb/aoconnect";
import toast from "react-hot-toast";
import { fetchUserByAddress } from "../api/user";
import { UserProfile } from "../types";
import { PROCCESSID } from "../types";

function Profile() {
  const [activeAddress, setActiveAddress] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [bio, setBio] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleCurrentWallet = async () => {
    const address = await window.arweaveWallet.getActiveAddress();
    setActiveAddress(address);
  };

  useEffect(() => {
    handleCurrentWallet();
  }, [activeAddress]);

  const fetchProfile = async () => {
    try {
      const res = await fetchUserByAddress(activeAddress);
      setProfile(res);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const registerProfile = async () => {
    try {
      const mid = await message({
        process: PROCCESSID.profile,
        tags: [
          { name: "Action", value: "Register" },
          { name: "Target", value: "ao.id" },
          { name: "wallet_address", value: activeAddress },
          { name: "username", value: username },
          { name: "profile_img", value: profileImg },
          { name: "bio", value: bio },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Registration message ID:", mid);
      toast.success("Profile registered successfully!");
    } catch (err) {
      console.error("Error occurred during registration:", err);
      toast.error("Failed to register profile.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeAddress) {
      setIsFetching(true);
      await registerProfile();
    }
  };

  useEffect(() => {
    if (activeAddress) {
      setIsFetching(true);
      fetchProfile();
    }
  }, [activeAddress]);

  if (isFetching) {
    return <div className="bg-white min-h-screen mt-52">Loading...</div>;
  }

  return (
    <>
      {profile ? (
        <div className="bg-white min-h-screen">
          <div className="max-w-screen-xl px-4 py-8 mx-auto mt-24">
            <div className="flex justify-between">
              <div className="flex gap-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Cat_-1_%2826079853855%29.jpg/1200px-Cat_-1_%2826079853855%29.jpg"
                  className="aspect-square w-28 object-cover rounded-full"
                />
                <div className="mt-6">
                  <p className="text-lg font-bold">@{profile?.username}</p>
                  <p>{profile?.wallet_address}</p>
                </div>
              </div>
              <div>
                <button className="mt-8 bg-gray-300 px-5 py-2 rounded-lg">
                  Edit profile
                </button>
              </div>
            </div>
            <div className="mt-12">
              <p className="text-lg font-bold">About</p>
              <p className="mt-2">{profile?.bio}</p>
            </div>
            <div className="mt-12">
              <p className="text-lg font-bold">My Assets</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white min-h-screen flex flex-col justify-center items-center mt-12 text-black">
          <h1 className="font-bold text-2xl">Create Profile</h1>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mt-8">
              <label htmlFor="username" className="text-xl font-semibold">
                Username*
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-72 mt-1 rounded-md h-10 border border-gray-500"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label htmlFor="profile_img" className="text-xl font-semibold">
                Profile Image URL
              </label>
              <input
                id="profile_img"
                type="text"
                value={profileImg}
                onChange={(e) => setProfileImg(e.target.value)}
                className="w-72 mt-1 rounded-md h-10 border border-gray-500"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label htmlFor="bio" className="text-xl font-semibold">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-72 mt-1 rounded-md h-20 border border-gray-500"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-300 px-5 py-2 rounded-lg mt-4"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Profile;
