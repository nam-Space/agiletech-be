const { default: aqp } = require("api-query-params");
const Tag = require("../db/tagModel");

const getAllTags = async (request, response) => {
    try {
        const { current = 1, limit = 10 } = request.query
        const qs = request.query
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.limit;

        const offset = (current - 1) * +limit;
        const defaultLimit = limit ? limit : 10;
        const totalItems = (await Tag.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await Tag
            .find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort)
            .populate(population)
            .exec()

        return response.json({
            isError: false,
            meta: {
                current: current, //trang hiện tại
                pageSize: limit, //số lượng bản ghi đã lấy
                pages: totalPages, //tổng số trang với điều kiện query
                total: totalItems, // tổng số phần tử (số bản ghi)
            },
            data: result, //kết quả query
        });
    } catch (error) {
        return response.status(400).send({ isError: true, error });
    }
}

const getTagById = async (request, response) => {
    try {
        const { id } = request.params
        const tag = await Tag.findOne({ _id: id })
        if (!tag) {
            return response.json({
                isError: true,
                message: 'Cannot find tag',
            });
        }
        return response.json({
            isError: false,
            data: tag,
        });
    } catch (error) {
        return response.status(400).send({ isError: true, error });
    }
}

const createNewTag = async (request, response) => {
    try {
        const { title, description } = request.body

        const res = await Tag.create({
            title,
            description,
        })
        return response.json({
            isError: false,
            data: res,
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

const updateTagById = async (request, response) => {
    try {
        const { id } = request.params
        const { title, description } = request.body
        const tag = await Tag.findOne({ _id: id })
        if (!tag) {
            return response.json({
                isError: true,
                message: 'Cannot find tag',
            });
        }

        const res = await Tag.updateOne(
            { _id: id },
            {
                title,
                description,
            },
        )

        return response.json({
            isError: false,
            data: res,
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

const deleteTagById = async (request, response) => {
    try {
        const { id } = request.params
        const tag = await Tag.findOne({ _id: id })
        if (!tag) {
            return response.json({
                isError: true,
                message: 'Cannot find tag',
            });
        }

        const res = await Tag.deleteOne(
            { _id: id },
        )

        return response.json({
            isError: false,
            data: 'Delete post successfully!',
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

module.exports = {
    getAllTags,
    getTagById,
    createNewTag,
    updateTagById,
    deleteTagById
}