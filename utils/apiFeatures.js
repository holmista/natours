class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter = () => {
    // 1A) filtering
    const query = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((elem) => delete query[elem]);

    // 1B) advanced filtering
    let queryString = JSON.stringify(query);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  };
  sort = () => {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      const sortQuery = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortQuery);
    } else {
      // createdAt is the same so mongoose can't sort properly
      // sorting always happens before skipping and limiting.
      this.query = this.query.sort({ createdAt: -1, _id: 1 });
    }
    return this;
  };
  limit = () => {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  };
  paginate = () => {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // skipping happens before limiting
    this.query = this.query.skip(skip).limit(limit);
    return this;
  };
}

module.exports = APIfeatures;
