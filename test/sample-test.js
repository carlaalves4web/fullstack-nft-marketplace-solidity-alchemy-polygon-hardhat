const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

// Create a new NFT
// Check NFT owner of is == to expected owner address
// List new NFT on Marketplace
// Fetch all marketplace items
// Put NFT on Sale
// Fetch all Marketplace items on sale
// Sale NFT
// 

let marketplace;
let nft;

describe("NFT", function () {

  it("Should deploy a new NFT and NFT Marketplace contracts", async function(){
    const Marketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();

    const NFT = await ethers.getContractFactory('NFT');
    nft = await NFT.deploy(marketplace.address);
    
    await nft.deployed();
  })
  it("Should Create a new NFT Marketplace and List it on the Marketplace", async function () {

    const tokenId = await nft.createToken("https://www.tokeuri.com")
    const [owner, buyer] = await ethers.getSigners();
    const ownerOfToken = await nft.ownerOf(1).toString();
    expect(ownerOfToken == owner)
    expect(ownerOfToken!= buyer)
  
   
  });

  it("Should create a new market item and list it", async function(){

    let itemsTemp = await marketplace.fetchAllItems()
    
    itemsTemp = await Promise.all(itemsTemp.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        id: i.itemId.toString(),
        tokenId: i.tokenId.toString(),
        owner: i.owner,
        lastSeller: i.lastSeller,
        price: i.price.toString(),
        tokenUri
      }
      return item
    }))

    expect(itemsTemp.length == 0)

    await marketplace.createMarketItem(1, nft.address);

    let items = await marketplace.fetchAllItems()
    
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        id: i.itemId.toString(),
        tokenId: i.tokenId.toString(),
        owner: i.owner,
        lastSeller: i.lastSeller,
        price: i.price.toString(),
        tokenUri
      }
      return item
    }))

    expect(items.length == 1)
    
  });

  it("Should fail - Only Owner can list", async function(){
    const [owner, buyer] = await ethers.getSigners();
    let hasFailed = false;
    try{
      await marketplace.connect(buyer).createMarketItem(1, nft.address);
    }catch(e){
      hasFailed=true;
    }
    assert.equal(hasFailed, true);
  });

  it("Should put and retrieve a new item on sale", async function(){
    let itemsTemp = await marketplace.fetchAllItemsOnSale()
    try{
      itemsTemp = await Promise.all(itemsTemp.map(async i => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          id: i.itemId.toString(),
          tokenId: i.tokenId.toString(),
          owner: i.owner,
          lastSeller: i.lastSeller,
          price: i.price.toString(),
          tokenUri
        }
        return item
      }))
    }catch(e){

    }
  

    expect(itemsTemp.length == 0)




    const listingFees = ethers.utils.parseUnits('0.025', 'ether');

    await marketplace.listItemOnSale(1, nft.address, listingFees, {value: listingFees});



    let items = await marketplace.fetchAllItemsOnSale()
    
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        id: i.itemId.toString(),
        tokenId: i.tokenId.toString(),
        owner: i.owner,
        lastSeller: i.lastSeller,
        price: i.price.toString(),
        tokenUri
      }
      return item
    }))

    expect(items.length == 1)
  });

  it("Should sale the NFT", async function(){
    const [_, buyer] = await ethers.getSigners();
    const listingFees = ethers.utils.parseUnits('0.025', 'ether');
    await marketplace.connect(buyer).sellMarketItem(1, nft.address, {value: listingFees})
    const owner = await nft.ownerOf(1)
    assert.equal(owner, buyer.address)
  })

});
