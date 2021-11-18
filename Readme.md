**Installation Instructions**

1. `yarn install` while in root directory
2. Attach Manfiest.lkml file to project in Looker (ensure appropriate model access)
3. Adjust dashboard id in MainDashboard.tsx component (*some vis types might need further checks when changing color, etc. be warned*)
5. `yarn dev` to run dev server (*output should be http://localhost:8080/bundle.js, which will be the url in the application parameter of the manifest*)
