const { default: aqp } = require("api-query-params");
const Post = require("../db/postModel");

const getAllPosts = async (request, response) => {
    try {
        const { current = 1, limit = 10 } = request.query
        const qs = request.query
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.limit;

        const offset = (current - 1) * +limit;
        const defaultLimit = limit ? limit : 10;
        const totalItems = (await Post.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await Post
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

const getPostById = async (request, response) => {
    try {
        const { id } = request.params
        const post = await Post.findOne({ _id: id })
        if (!post) {
            return response.json({
                isError: true,
                message: 'Cannot find post',
            });
        }
        return response.json({
            isError: false,
            data: post,
        });
    } catch (error) {
        return response.status(400).send({ isError: true, error });
    }
}

const createNewPost = async (request, response) => {
    try {
        const user = request.user;
        const { title, description, tags } = request.body

        const res = await Post.create({
            title,
            description,
            tags,
            user: user._id
        })
        return response.json({
            isError: false,
            data: res,
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

const updatePostById = async (request, response) => {
    try {
        const user = request.user;
        const { id } = request.params
        const { title, description, tags } = request.body
        const post = await Post.findOne({ _id: id })
        if (!post) {
            return response.json({
                isError: true,
                message: 'Cannot find post',
            });
        }

        const res = await Post.updateOne(
            { _id: id },
            {
                title,
                description,
                tags,
                user: user._id
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

const deletePostById = async (request, response) => {
    try {
        const user = request.user;
        const { id } = request.params
        const post = await Post.findOne({ _id: id })
        if (!post) {
            return response.json({
                isError: true,
                message: 'Cannot find post',
            });
        }

        if (user._id !== post.user.toString()) {
            return response.json({
                isError: true,
                message: 'Cannot delete post! You are not permission to delete',
            });
        }

        const res = await Post.deleteOne(
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
    getAllPosts,
    getPostById,
    createNewPost,
    updatePostById,
    deletePostById
}