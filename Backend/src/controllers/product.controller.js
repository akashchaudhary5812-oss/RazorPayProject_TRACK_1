const productModel = require('../models/product.model');

async function addProducts(req,res){
    const {productName,stockAvailable,brandName,releaseDate,discount,price,category} = req.body;
    
    const product = new productModel({
          productName,
          stockAvailable,
          brandName,
          releaseDate,
          discount,
          price,
          category
    });

    const savedProduct = await product.save();

    res.status(201).json({
        "success" : "true",
        "message" : "Product Added Succesfully"
    });

};


async function getProductsById(req,res){
    const id = req.params.id;
    
    const products = productModel.findById(id);

    res.status(200).json({
        data : products,
        "message" : "Fetched Successfully!!"
    })

}

async function allProducts(req,res){
      const products = await productModel.find();

      res.status(200).json({
        data : products,
        "message" : "Fetched Successfully!!"
    })
}

async function getProductsBySearch(req,res){
      const searchedItem = req.params.productName;

      const product = productModel.find(searchedItem);

      res.status(200).json({
         message : "Fetched Product",
      })

}

async function deleteProductById(req,res){
      const id = req.params.id;

      const product = productModel.findByIdAndDelete(id);

      res.status(200).json({
          message : "Deleted Successfully!!",
          deletedIs : product
      })

}

module.exports = { addProducts, getProductsById, allProducts, getProductsBySearch };

