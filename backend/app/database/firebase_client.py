import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from app.config.settings import settings
from app.utils.logger import logger

db = None
is_mock = False

class MockCollectionReference:
    def __init__(self, db_instance, collection_name):
        self.db_instance = db_instance
        self.collection_name = collection_name

    def document(self, document_id=None):
        return MockDocumentReference(self.db_instance, self.collection_name, document_id)

    def where(self, field_path, op_string, value):
        return MockQuery(self.db_instance, self.collection_name, [(field_path, op_string, value)])

    def order_by(self, field_path, direction="ASCENDING"):
        return MockQuery(self.db_instance, self.collection_name, [], order_by=(field_path, direction))

    def limit(self, count):
        return MockQuery(self.db_instance, self.collection_name, [], limit=count)

    def stream(self):
        return MockQuery(self.db_instance, self.collection_name, []).stream()

    def get(self):
        return MockQuery(self.db_instance, self.collection_name, []).get()


class MockDocumentReference:
    def __init__(self, db_instance, collection_name, document_id=None):
        self.db_instance = db_instance
        self.collection_name = collection_name
        import uuid
        self.id = document_id if document_id else str(uuid.uuid4())

    def get(self):
        data = self.db_instance._get_data(self.collection_name, self.id)
        return MockDocumentSnapshot(self.id, data)

    def set(self, document_data, merge=False):
        self.db_instance._set_data(self.collection_name, self.id, document_data, merge)
        return self

    def update(self, document_data):
        self.db_instance._update_data(self.collection_name, self.id, document_data)
        return self

    def delete(self):
        self.db_instance._delete_data(self.collection_name, self.id)
        return self

    def collection(self, collection_name):
        # Support subcollections if needed
        sub_name = f"{self.collection_name}/{self.id}/{collection_name}"
        return MockCollectionReference(self.db_instance, sub_name)


class MockDocumentSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return self._data if self._data else {}


class MockQuery:
    def __init__(self, db_instance, collection_name, filters, order_by=None, limit=None):
        self.db_instance = db_instance
        self.collection_name = collection_name
        self.filters = filters
        self.order_by_clause = order_by
        self.limit_clause = limit

    def where(self, field_path, op_string, value):
        new_filters = list(self.filters)
        new_filters.append((field_path, op_string, value))
        return MockQuery(self.db_instance, self.collection_name, new_filters, self.order_by_clause, self.limit_clause)

    def order_by(self, field_path, direction="ASCENDING"):
        return MockQuery(self.db_instance, self.collection_name, self.filters, (field_path, direction), self.limit_clause)

    def limit(self, count):
        return MockQuery(self.db_instance, self.collection_name, self.filters, self.order_by_clause, count)

    def stream(self):
        docs = self.db_instance._get_collection(self.collection_name)
        results = []
        for doc_id, data in docs.items():
            match = True
            for field, op, val in self.filters:
                doc_val = data.get(field)
                if op == "==" and doc_val != val:
                    match = False
                elif op == "!=" and doc_val == val:
                    match = False
                elif op == ">" and (doc_val is None or not (doc_val > val)):
                    match = False
                elif op == "<" and (doc_val is None or not (doc_val < val)):
                    match = False
                elif op == "in" and (doc_val not in val if isinstance(val, (list, tuple, set)) else doc_val != val):
                    match = False
            if match:
                results.append(MockDocumentSnapshot(doc_id, data))

        # Sorting
        if self.order_by_clause:
            field, direction = self.order_by_clause
            reverse = direction == "DESCENDING" or direction == "desc"
            # Handle missing fields in sort gracefully
            results.sort(key=lambda x: x.to_dict().get(field, ""), reverse=reverse)

        # Limit
        if self.limit_clause:
            results = results[:self.limit_clause]

        return results

    def get(self):
        return self.stream()


class MockFirestoreClient:
    def __init__(self):
        self._store = {}
        logger.info("Initialized In-Memory Mock Firestore Database for offline development.")

    def collection(self, collection_name):
        return MockCollectionReference(self, collection_name)

    def _get_collection(self, collection_name):
        if collection_name not in self._store:
            self._store[collection_name] = {}
        return self._store[collection_name]

    def _get_data(self, collection_name, doc_id):
        col = self._get_collection(collection_name)
        return col.get(doc_id)

    def _set_data(self, collection_name, doc_id, data, merge=False):
        col = self._get_collection(collection_name)
        if merge and doc_id in col:
            col[doc_id].update(data)
        else:
            col[doc_id] = dict(data)

    def _update_data(self, collection_name, doc_id, data):
        col = self._get_collection(collection_name)
        if doc_id in col:
            col[doc_id].update(data)
        else:
            col[doc_id] = dict(data)

    def _delete_data(self, collection_name, doc_id):
        col = self._get_collection(collection_name)
        if doc_id in col:
            del col[doc_id]


# Try to initialize Firebase SDK
cred_path = settings.FIREBASE_CREDENTIALS_PATH

if os.path.exists(cred_path):
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        logger.info(f"Firebase initialized successfully with credentials from {cred_path}")
    except Exception as e:
        logger.error(f"Error initializing Firebase with service account: {e}. Falling back to mock client.")
        db = MockFirestoreClient()
        is_mock = True
else:
    # Attempt Default credentials
    try:
        firebase_admin.initialize_app()
        db = firestore.client()
        logger.info("Firebase initialized successfully using default credentials.")
    except Exception as e:
        logger.warning(
            f"Firebase service credentials not found at {cred_path} and default credentials failed. "
            "App will run with mock in-memory database storage."
        )
        db = MockFirestoreClient()
        is_mock = True

def get_db():
    global db
    return db
