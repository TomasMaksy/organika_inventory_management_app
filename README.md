# Tomas Maksimovic | CS50x 2024 final project

This project is a full-stack Inventory Management app developed in JavaScript with React, Tailwind, Nextjs, Redux and Node. I built it for my father who has a small company which processes big foam blocks and cuts required shapes of foam which are later used in matrasses, chairs, sofas and other furniture. 

## Web App overview
The first page is called dashboard, where we will be able to see all the most important information about the company, as of now there are just two cards actually usable (Latest Arrivals and Storage Capacity), but as the app is developed further and new functionalities are implemented we will make use of the other cards, but as of now they are filled with fake (dummy data) and therefore their opacity is reduced.

We are able to navigate different pages through the sidebar which is collapsible. There is also a dark mode functionality. 

### Inventory Page
The next page is the Inventory where the forklift operator can add new blocks to storage, by specifying some required information like: Supplier, Block Type, Dimensions (in mm), other metadata will be added automatically like arrival date etc. This page displays all the blocks currently in storage, allows to mark blocks as processed (meaning they have left the storage and are being cut into desired shapes). There is option to filter blocks, search for a specific block as well as remove blocks, that were added by mistake (there is also a pop up window which will ask to confirm the deletion).
### Block Types Page
This page was designed to add, edit and remove different block types. Every block type used has it's own card which also contains buttons displaying how many blocks of that type there are in total and how many blocks of that type per supplier. By clicking these buttons we can view a pop up table with only the blocks in question shown.
### Suppliers Page
Very similar functionality to the block types page but considers suppliers instead of block types. Allows the same editing, addition, removal and quick filtering as the page before.

The other pages, do not have much functionality as of now. 
