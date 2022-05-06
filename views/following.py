from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # return all of the "following" records that the current user is following
        followings = Following.query.filter_by(user_id = self.current_user.id)
        followings_json = [following.to_dict_following() for following in followings]

        return Response(json.dumps(followings_json), mimetype="application/json", status=200)

    def post(self):
        # create a new "following" record based on the data posted in the body 
        body = request.get_json()
        print(body)

        if not body.get('user_id'):
            return Response(json.dumps({"message":"'user_id' is required."}), mimetype="application/json", status=400)

        # if body.get(user_id) is a string then return
        if not str(body.get('user_id')).isdigit():
            return Response(json.dumps({"message":"'user_id' is not a number."}), mimetype="application/json", status=400)

        if body.get('user_id') > 999:
            return Response(json.dumps({"message":"'user_id' is too big."}), mimetype="application/json", status=404)

        # filters 
        followings = Following.query.filter_by(user_id = self.current_user.id).filter_by(following_id = body.get('user_id')).all()

        if followings != []:
            return Response(json.dumps({"message":"'user_id' is already being followed."}), mimetype="application/json", status=400)
        
        new_following = Following(
            self.current_user.id,
            body.get("user_id")
        )

        db.session.add(new_following)    # issues the insert statement
        db.session.commit() 

        return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "following" record where "id"=id
        following = Following.query.get(id)

        # Check if following exists
        if not following:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)

        # You should only be able to edit/or delete posts that you yourself created
        if following.user_id != self.current_user.id:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)

        Following.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message":"Following id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)




def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<int:id>', 
        '/api/following/<int:id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
