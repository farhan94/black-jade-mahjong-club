# Black Jade Mahjong Club

## About

This is a demo website I am working on in my spare time to practice frontend coding, which I don't get much exposure to in my daily work. This project uses the NextJS framework along with tailwind.

I'm creating this project to serve as a homepage for the Black Jade Mahjong Club, which is a secretive organization in the Azuki world. As such, and because I'm a fan of Azuki's design language, I'm planning on mimicking a lot of the styles and website design from <a href="https://azuki.com" target="_blank">azuki.com</a>.

At the same time, since I want this to be a learning experience for myself, I'll be attempting to keep things fresh.


## Goals and To Do

- **Loading page** - have a dope graphic on home page load. Maybe a flash of lightning then homepage appears?

- **Home page** - commission artwork of an silent street in The Alley. There will be a door with the signage of the BJMC (a rabbit) on top of it. My BJMC Elemental will be leaning on the wall near or next to the door, waiting and reading his manifesto. Add a rain or fog animation on top of it.

- **Nav Bar** - similar to Azuki's website, with links to the following pages:

    - **About** - Possibly not needed. Maybe I can add some flavor lore text. Also maybe have a mysterious background image.

    - **Membership** - List of current members with images of their BJMC Elemental. There should be links to their respective Azuki collector profile. Use the blockchain to find the wallet address of the current owner and create the collector profile link using that. Additionally, see if it's worth scraping the Twitter profile linked to their collector profile (if it exists), and adding that link on this page as well. <br/><br/>
    I'll make this barebones at first, but I want this to look cool, rather than just a page with some pictures and links. Ideas:
    <br/> <br/>
        1. Maybe transition to a load screen, and have the manifesto book (that my BJMC elemental holds) come onto the screen. The user can then flip the pages to see members. There can be tabs in the book with the mahjong symbols on it. When the user clicks one of the tabs it flips to that page and displays that respective member's Elemental and has a link to their collector profile.
    <br/> <br/>
    
    - **Gallery Page** - displays a collage of BJMC related commissions and pictures (with their permission). This should look cool, yet organized. Kind of how Azuki arranges pictures of thier work on the <a href="https://azuki.com/about" target="_blank">About page of their website</a>.

    - **TCG Page** - Displays BJMC related cards from the TCG 


## Design/Logic

### Github Action to Fetch Metadata
I decided to go with a GitHub action to fetch Elemental metadata because this information is fairly static. The only information I could see changing is the image url, if the team decides to change the url or something, which I doubt will happen. 

### Server side vs Client side processing of the NFT ownership information
I want to make sure owners are up to date and displayed correctly on the Membership page. For this, I had initially considered finding the owner of each relevant BJMC Elemental either client- or server-side, but I thought a better implementation of getting the owners would be to do it via a github action that runs on a cron schedule. There are a few reasons for doing it this way for the time being:

- One is that this should make loading in this information a lot quicker than having to get owner information, since the information will always be available, and no processing needs to be done on it.

- Another reason is that owners of these specific Elementals don't change often. Therefore, it would be a bit of a waste to have to process this information server or client side every load, when it's fairly static. TODO: look into cache/chaching

## TODOs:
Elemental Metadata:
- Add Opensea profile scraping as a fallback when we can't find the X/Twitter Account on the Azuki Collect Profile Page
Housekeeping:
- Build and deploy GHA
- Auto delete merged branches




# NextJS Boilerplate
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
