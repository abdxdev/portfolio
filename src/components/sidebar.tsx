import { Skills } from "./skills";
import { Profile } from "./profile";
import { Conversation } from "./conversation";
import { Blogs } from "./blogs";

export const Sidebar = () => {
  return (
    <aside className="md:col-span-1">
      {/* Profile Section */}
      <Profile />
      {/* Skills Section */}
      <Skills id="skills" />
      {/* Conversation Section */}
      <Conversation id="conversation" />
      {/* Blogs Section */}
      <Blogs id="blogs" />
    </aside>
  )
}