from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
from views import get_authorized_user_ids, can_view_post

import flask_jwt_extended

import json

class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        # get all bookmarks owned by the current user
        # current_users = get_authorized_user_ids(self.current_user)
        bookmarks = Bookmark.query.filter_by(user_id = self.current_user.id)

        bookmark_json = [b.to_dict() for b in bookmarks]

        return Response(json.dumps(bookmark_json), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "bookmark" based on the data posted in the body 
        body = request.get_json()
        print(body)

        current_users = get_authorized_user_ids(self.current_user)
        # return Response(json.dumps(bookmark.to_dict()), mimetype="application/json", status=201)
        if not body.get('post_id'):
            return Response(json.dumps({"message":"'post_id' is required."}), mimetype="application/json", status=400)

        # if body.get(post_id) is a string then return
        user_id = self.current_user.id
        post_id = body.get("post_id")

        try:
            post_id = int(post_id)
        except:
            return Response(json.dumps({"message":"'post_id' is not a number."}), mimetype="application/json", status=400)
        # if not str(body.get('post_id')).isdigit():
        #     return Response(json.dumps({"message":"'post_id' is not a number."}), mimetype="application/json", status=400)

        if post_id > 999:
            return Response(json.dumps({"message":"'post_id' is too big."}), mimetype="application/json", status=404)

        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({"message":"'user_id' is not viewable"}), mimetype="application/json", status=404)
        # if post_id not in current_users:
        #     return Response(json.dumps({"message":"'post_id' is not accessible."}), mimetype="application/json", status=404)

        # filters (gets rid of duplicates))
        bookmarks = Bookmark.query.filter_by(user_id = self.current_user.id).filter_by(post_id = body.get('post_id')).all()

        if bookmarks != []:
            return Response(json.dumps({"message":"'user_id' is already bookmarked."}), mimetype="application/json", status=400)

        new_bookmark = Bookmark(
            user_id,
            post_id
        )

        db.session.add(new_bookmark)    # issues the insert statement
        db.session.commit() 

        return Response(json.dumps(new_bookmark.to_dict()), mimetype="application/json", status=201)

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "bookmark" record where "id"=id
        print(id)

        bookmark = Bookmark.query.get(id)

        # Check if bookmark exists
        if not bookmark:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)

        # You should only be able to edit/or delete bookmarks that you yourself created
        if bookmark.user_id != self.current_user.id:
            return Response(json.dumps({"message":"id={0} is invalid".format(id)}), mimetype="application/json", status=404)


        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message":"Bookmark id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<int:id>', 
        '/api/bookmarks/<int:id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
