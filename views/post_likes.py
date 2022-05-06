from flask import Response, request
from flask_restful import Resource
from models import LikePost, db
import json
from views import get_authorized_user_ids
class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # create a new "like_post" based on the data posted in the body 
        body = request.get_json()
        print(body)
        
        try:
            user_id = self.current_user.id
            post_id = int(body.get('post_id'))

            current_users = get_authorized_user_ids(self.current_user)
            users_posts = LikePost.query.filter(LikePost.user_id.in_(current_users))
            users_posts = [post.to_dict().get('id') for post in users_posts]

            if post_id in users_posts:
                new_like = LikePost(user_id, post_id)

                db.session.add(new_like)
                db.session.commit()
            
            else:
                return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)
        except:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=400)

        
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        print(id)

        lp = LikePost.query.get(id)

        # Check if bookmark exists
        if not lp:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)

        # You should only be able to edit/or delete bookmarks that you yourself created
        if lp.user_id != self.current_user.id:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)


        LikePost.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message":"Bookmark id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/likes', 
        '/api/posts/likes/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/likes/<int:id>', 
        '/api/posts/likes/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
