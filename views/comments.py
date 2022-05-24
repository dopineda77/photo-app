from flask import Response, request
from flask_restful import Resource
import json
from models import db, Comment, Post
from views import get_authorized_user_ids

import flask_jwt_extended


class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "Comment" based on the data posted in the body 
        body = request.get_json()
        print(body)

        try:
            user_id = self.current_user.id
            post_id = int(body.get('post_id'))
            text = body.get('text')

            current_users = get_authorized_user_ids(self.current_user)
            users_posts = Post.query.filter(Post.user_id.in_(current_users))
            users_posts = [post.to_dict().get('id') for post in users_posts]

            if post_id in users_posts:
                new_comment = Comment(text, user_id, post_id)

                db.session.add(new_comment)
                db.session.commit()

            else:
                return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)
        except:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=400)


        return Response(json.dumps(new_comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  

    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "Comment" record where "id"=id
        print(id)

        comment = Comment.query.get(id)

        # Check if comment exists
        if not comment:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)

        # You should only be able to edit/or delete comment that you yourself created
        if comment.user_id != self.current_user.id:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)


        Comment.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message":"Comment id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<int:id>', 
        '/api/comments/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
