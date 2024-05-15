import path from "node:path";

const maps_folder =
  "D:/Steam/steamapps/common/Counter-Strike Global Offensive/csgo/maps/kz";
const map = "kz_test";

const map_path = path.join(maps_folder, `${map}.bsp"`);

console.log(map_path);
