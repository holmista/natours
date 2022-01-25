const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');

const deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id, {
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    const modelName = model.modelName;
    const resp = { status: 'success' };
    resp[modelName] = doc;
    res.status(204).json(resp);
  });
};

const updateOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    //console.log(updatedTour);
    const modelName = model.modelName;
    const resp = { status: 'success' };
    resp[modelName] = doc;
    res.status(200).json(resp);
  });
};

const createOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    const modelName = model.modelName;
    const resp = { status: 'success' };
    resp[modelName] = doc;
    res.status(201).json(resp);
  });
};

const getOne = (model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    const modelName = model.modelName;
    const resp = { status: 'success' };
    resp[modelName] = doc;
    res.status(200).json(resp);
  });
};

const getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    // to allow nested reviews on a tour
    let filter = {};
    if (req.params.tourID) {
      filter = { tour: req.params.tourID };
    }

    let features = new APIfeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    let docs = await features.query; // .explain()
    const modelName = model.modelName;
    const resp = { status: 'success', results: docs.length };
    resp[modelName] = docs;
    res.status(200).json(resp);
  });
};

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
