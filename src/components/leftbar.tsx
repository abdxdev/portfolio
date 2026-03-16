import { Skills } from "./skills";
import { Profile } from "./profile";
import { Conversation } from "./conversation";
import { Education } from "./education";
import { Blogs } from "./blogs";

export const Leftbar = () => {
  return (
    <aside className="md:col-span-1 gap-6 flex flex-col">
      <Profile />
      <Skills id="skills" />
      <Education id="education" />
      <Conversation id="conversation" />
      <Blogs id="blogs" />
    </aside>
  )
}