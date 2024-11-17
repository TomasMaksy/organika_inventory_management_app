# Tomas Maksimovic | CS50x 2024 final project
#### Video Demo: https://youtu.be/Y7q8EIVMzfc
This is a full-stack inventory management app I built for my dad's small business. His company processes large foam blocks, cutting them into custom shapes used in things like mattresses, chairs, sofas, and other furniture. The app is designed to make managing inventory easier and more efficient, using modern tools like React, Tailwind, Next.js, Redux, and Node.js.

## Web App overview
The app opens with a dashboard, which serves as the central hub for all the company's key data. Right now, only two cards are fully functional: Latest Arrivals and Storage Capacity. These provide real-time information about recent inventory additions and the available storage space. The other cards are placeholders for future features, filled with dummy data for now, and have reduced opacity to indicate they’re not active yet.

Navigation is simple, thanks to a collapsible sidebar that lets you switch between pages easily. There's also a built-in dark mode, which gives the app a sleek, modern look and makes it more comfortable to use in different lighting conditions.

### Inventory Page
This is the heart of the app. On the Inventory page, the forklift operator can log new foam blocks as they arrive. They enter essential details like the supplier name, block type, and dimensions (in millimeters). The app automatically adds other metadata, such as the arrival date, saving time and reducing errors.

The page displays all blocks currently in storage in a clean, easy-to-read layout. Operators can mark blocks as processed when they leave storage to be cut into specific shapes. There are tools to filter blocks, search for specific blocks, and delete blocks that were added by mistake. Deletions include a pop-up confirmation step to prevent accidental removal.
### Block Types Page
The Block Types page focuses on managing the different types of foam blocks used by the company. Each type is displayed as a card, showing key stats like the total number of blocks for that type and a breakdown by supplier. These numbers are clickable, opening a detailed pop-up table with just the relevant blocks listed.

This page also allows you to add, edit, or remove block types as needed, ensuring everything stays organized and up-to-date. It is primarily used to check whether the needed blocks are in storage or should be ordered. There also is a search bar which allows you to quickly check the blocks you need
### Suppliers Page
The Suppliers page works similarly to the Block Types page but focuses on the company's suppliers instead. It lets you manage all supplier-related data, including adding, editing, and removing supplier entries. Like on the Block Types page, you can quickly filter blocks or view detailed tables with specific data about blocks from a given supplier.
### Future plans
While some of the other pages don’t have much functionality yet, they’re placeholders for future features. The goal is to expand the app with more tools and insights to help the business grow. Over time, I’ll add new features and integrate the data to make full use of the dashboard cards.
