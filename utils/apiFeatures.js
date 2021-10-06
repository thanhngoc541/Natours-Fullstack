class APIFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    let queryObj = { ...this.queryObj };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'offset'];
    excludedFields.forEach((field) => delete queryObj[field]);

    //1B Advanced filtering
    const queryStr = JSON.stringify(queryObj);
    queryObj = JSON.parse(queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`));
    // let query = Tour.find(queryObj);
    this.query.find(queryObj);
    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v');
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      if (Array.isArray(this.queryObj.sort))
        this.queryObj.sort = this.queryObj.sort.filter((x, i) => i === this.queryObj.sort.indexOf(x)).join();
      const sortBy = this.queryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('-createdAt'); //newest first
    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 20;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
