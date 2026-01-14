import copy
from urllib.parse import quote

from fastapi.testclient import TestClient

from src import app as app_module
from src.app import app, activities


client = TestClient(app)


def restore_activities(snapshot):
    activities.clear()
    activities.update(snapshot)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # known activity present
    assert "Basketball" in data


def test_signup_and_unregister_flow():
    snapshot = copy.deepcopy(activities)
    activity = "Chess Club"
    email = "test.user@example.com"

    try:
        # ensure not present
        if email in activities[activity]["participants"]:
            activities[activity]["participants"].remove(email)

        # Signup
        resp = client.post(f"/activities/{quote(activity)}/signup", params={"email": email})
        assert resp.status_code == 200
        assert email in activities[activity]["participants"]

        # Duplicate signup -> 400
        resp2 = client.post(f"/activities/{quote(activity)}/signup", params={"email": email})
        assert resp2.status_code == 400

        # Unregister
        resp3 = client.delete(f"/activities/{quote(activity)}/participants", params={"email": email})
        assert resp3.status_code == 200
        assert email not in activities[activity]["participants"]

        # Unregistering again should return 404
        resp4 = client.delete(f"/activities/{quote(activity)}/participants", params={"email": email})
        assert resp4.status_code == 404

    finally:
        restore_activities(snapshot)
*** End Patch