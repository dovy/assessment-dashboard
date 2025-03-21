import json
import boto3
from botocore.exceptions import ClientError
import os
import time
from datetime import datetime
import mimetypes
import base64

date_format = "%Y-%m-%d %H:%M:%S.%f"  # Define the format that matches the date string

# Replace these with your actual values
ATHENA_DATABASE = os.environ.get('ATHENA_DATABASE', 'centralized')
ATHENA_WORKGROUP = os.environ.get('ATHENA_WORKGROUP', 'centralized')
ATHENA_TABLE = os.environ.get('ATHENA_TABLE', 'logs2')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', '724772060572-us-east-1-console-centralized')
ATHENA_OUTPUT_S3_URI = f"s3://{S3_BUCKET_NAME}/athena-results/"
# Setup the Athena client
client = boto3.client('athena')


def lambda_handler(event, context):
    # Base directory where your files are stored
    root = os.path.dirname(__file__)

    # Extract the path from the event
    requested_path = event.get('path', '/').lstrip('/')

    # Default to index.html if the root is accessed
    if requested_path == '' or requested_path == 'client':
        requested_path = 'index.html'
    print(requested_path)
    print('WORD')
    if requested_path == "api/all":
        return get_clients_data(event)
    if requested_path == "api/client":
        if not event['queryStringParameters'] or (
                event['queryStringParameters'] and 'name' not in event['queryStringParameters']):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing client name'})
            }
        client_name = event['queryStringParameters']['name']
        return get_client_drilldown(event, client_name)
    # elif event['path'] == "/client":
    #     return get_client_drilldown_view(event)

    # Construct the file path
    filepath = os.path.join(root, 'public', requested_path)

    # Guess the MIME type of the file based on its extension
    content_type, _ = mimetypes.guess_type(filepath)
    if content_type is None:
        content_type = 'application/octet-stream'  # Default to binary stream if unknown

    try:
        # Open the file in binary mode
        with open(filepath, 'rb') as file:
            file_content = file.read()
            is_base64_encoded = 'text' not in content_type

            # return {
            #     'statusCode': 200,
            #     'headers': {
            #         'Content-Type': content_type,
            #         'Access-Control-Allow-Origin': '*'  # Allow CORS requests if needed
            #     },
            #     'body': content_type,
            #     'isBase64Encoded': is_base64_encoded
            # }

            if ".js" in filepath or ".png" in filepath:
                is_base64_encoded = False

            # Encode file content in base64 for binary files
            if is_base64_encoded and 'svg' not in content_type:
                file_content = base64.b64encode(file_content).decode('utf-8')

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': content_type,
                    'Access-Control-Allow-Origin': '*'  # Allow CORS requests if needed
                },
                'body': file_content,
                'isBase64Encoded': is_base64_encoded
            }
    except Exception as e:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'text/plain'},
            'body': f'File not found: {str(e)}'
        }

    # requested_path = event.get('path', '/')
    # root = os.path.dirname(__file__)
    #
    # # Default path to index.html
    # if requested_path in ['/', '']:
    #     filepath = os.path.join(root, 'public', 'index.html')
    #     content_type = 'text/html'
    # else:
    #     # Other files like images, CSS, etc.
    #     filepath = os.path.join(root, 'public', requested_path.strip('/'))
    #     content_type, _ = mimetypes.guess_type(filepath)
    #
    #
    # if 'path' not in event and 'rawPath' in event:
    #     event['path'] = event['rawPath']
    # if 'path' not in event:
    #     event['path'] = '/'

    # else:
    #     return get_dashboard_view(event)


def get_dashboard_view(event):
    # Set the path to the index.html file
    html_file_path = os.path.join(os.path.dirname(__file__), 'app/public', 'index.html')

    # Read the content of the index.html file
    try:
        with open(html_file_path, 'r') as file:
            content = file.read()
    except Exception as e:
        # In case the file is not found or some other error occurs
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/plain'},
            'body': f'Failed to load the page: {str(e)}'
        }

    # Return the content of the index.html file
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html'},
        'body': content
    }


def get_clients_data(event):
    # You might want to integrate with S3 to fetch and serve an HTML file
    # or generate HTML content dynamically

    data = {
        'body':
            [
                {
                    "client_name": "Example Corp",
                    "process": "lambda-profile",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "count": "3",
                    "latest_timestamp": "2025-02-28 14:09:57.131",
                    "avg_duration": "181.86266152064005"
                },
                {
                    "client_name": "Example Corp",
                    "process": "lambda-stage",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "count": "4",
                    "latest_timestamp": "2025-02-28 14:04:55.395",
                    "avg_duration": "23.995896339416504"
                }
            ]
    }
    if not os.getenv('AWS_SAM_LOCAL'):
        data = run_general_query()

    if 'queryStringParameters' in event and event['queryStringParameters'] and 'html' in event['queryStringParameters']:
        content = f"<html><body><h1>Query Results</h1><p>API results here.</p><code><pre>{json.dumps(data['body'], indent=2, sort_keys=True, default=str)}</pre></code></body></html>"
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/html'},
            'body': content
        }
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(data['body'])
    }


def get_client_drilldown(event, client_name):
    # You might want to integrate with S3 to fetch and serve an HTML file
    # or generate HTML content dynamically

    data = {
        'body': {
            "items": [
                {
                    "avg_duration": "175.5755717754364",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "6a5095ebefd1495ea5d98eadef9ad127",
                    "process": "lambda-profile",
                    "target_format": "csv",
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/meta/profile_athena/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv",
                    "timestamp_dt": "2025-02-28 14:09:57.131"
                },
                {
                    "avg_duration": "164.18754625320435",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "e5e3194748464d8eaed4f8e1452854cb",
                    "process": "lambda-profile",
                    "target_format": "csv",
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/meta/profile_athena/care_credit_sample_20250601_20250227_e5e3194748464d8eaed4f8e1452854cb.csv",
                    "timestamp_dt": "2025-02-27 22:35:57.072"
                },
                {
                    "avg_duration": "205.82486653327942",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "5732b53c056240e2a149322cd856300b",
                    "process": "lambda-profile",
                    "target_format": "csv",
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/meta/profile_athena/francis_test_12_20250227_5732b53c056240e2a149322cd856300b.csv",
                    "timestamp_dt": "2025-02-27 22:54:54.129"
                },
                {
                    "avg_duration": "84.43361020088196",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "5732b53c056240e2a149322cd856300b",
                    "process": "lambda-stage",
                    "target_format": None,
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/landing/francis_test_12_20250227_5732b53c056240e2a149322cd856300b.csv",
                    "timestamp_dt": "2025-02-27 22:48:42.394"
                },
                {
                    "avg_duration": "4.812428712844849",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "e5e3194748464d8eaed4f8e1452854cb",
                    "process": "lambda-stage",
                    "target_format": None,
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/landing/care_credit_sample_20250601_20250227_e5e3194748464d8eaed4f8e1452854cb.csv",
                    "timestamp_dt": "2025-02-27 22:30:24.860"
                },
                {
                    "avg_duration": "2.067328453063965",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "ce5e5614ff3d4013834051bb9f1fa39e",
                    "process": "lambda-stage",
                    "target_format": None,
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/landing/care_credit_sample_20250602_20250227_ce5e5614ff3d4013834051bb9f1fa39e.csv",
                    "timestamp_dt": "2025-02-27 22:30:28.160"
                },
                {
                    "avg_duration": "4.670217990875244",
                    "aws_account_id": "122610477593",
                    "aws_region": "us-east-1",
                    "file_hash": "6a5095ebefd1495ea5d98eadef9ad127",
                    "process": "lambda-stage",
                    "target_format": None,
                    "target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/landing/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv",
                    "timestamp_dt": "2025-02-28 14:04:55.395"
                }
            ],
            "stats": {
                "lambda-profile": {
                    "avg_duration": 181.86266152064005,
                    "count": 3,
                    "duration": [
                        175.5755717754364,
                        164.18754625320435,
                        205.82486653327942
                    ],
                    "files": {},
                    "latest_hash": "6a5095ebefd1495ea5d98eadef9ad127",
                    "latest_target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/meta/profile_athena/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv",
                    "latest_timestamp": "2025-02-28 14:09:57.131000"
                },
                "lambda-stage": {
                    "avg_duration": 23.995896339416504,
                    "count": 4,
                    "duration": [
                        84.43361020088196,
                        4.812428712844849,
                        2.067328453063965,
                        4.670217990875244
                    ],
                    "files": {},
                    "latest_hash": "6a5095ebefd1495ea5d98eadef9ad127",
                    "latest_target_name": "s3://122610477593-us-east-1-dev1-examplecorp-processing/landing/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv",
                    "latest_timestamp": "2025-02-28 14:04:55.395000"
                }
            }
        }
    }
    if not os.getenv('AWS_SAM_LOCAL'):
        data = run_drilldown_query(client_name)

        stats = {}
        for item in data['body']:
            if item['process'] not in stats:
                stats[item['process']] = {
                    'count': 0,
                    'duration': [],
                    'avg_duration': 0,
                    'latest_timestamp': datetime(year=1999, month=1, day=1),
                    'latest_hash': '',
                }
            stats[item['process']]['count'] += 1
            stats[item['process']]['duration'].append(float(item['avg_duration']))
            stats[item['process']]['avg_duration'] = sum(stats[item['process']]['duration']) / len(
                stats[item['process']]['duration'])
            parsed_date = datetime.strptime(item['timestamp_dt'], date_format)
            if parsed_date > stats[item['process']]['latest_timestamp']:
                stats[item['process']]['latest_timestamp'] = parsed_date
                stats[item['process']]['latest_hash'] = item['file_hash']
                stats[item['process']]['latest_target_name'] = item['target_name']

        data = {
            'body': {
                'items': data['body'],
                'stats': stats
            }
        }
    data = json.loads(json.dumps(data, indent=2, sort_keys=True, default=str))
    if 'queryStringParameters' in event and event['queryStringParameters'] and 'html' in event['queryStringParameters']:
        content = f"<html><body><h1>Query Results</h1><p>Client `{client_name}` API results here.</p><code><pre>{json.dumps(data['body'], indent=2, sort_keys=True, default=str)}</pre></code></body></html>"
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/html'},
            'body': content
        }
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': data['body']
    }


def run_general_query():
    query = """
SELECT client_name,
	process,
	aws_account_id,
	aws_region,
	count(*) as count,
	max(
		date_parse(SUBSTR(timestamp, 1, 23), '%Y-%m-%d %H:%i:%s,%f')
	) as latest_timestamp,
	avg(cast(duration as double)) as avg_duration
FROM "centralized"."logs"
WHERE step_key LIKE '%end%'
group by client_name,
	process,
	aws_account_id,
	aws_region
ORDER BY client_name,
	process ASC
    """

    return execute_query(query)


def run_drilldown_query(client_name):
    query = f"""
    SELECT process,
    date_parse(SUBSTR(timestamp, 1, 23), '%Y-%m-%d %H:%i:%s,%f') as timestamp_dt,
    target_name,
    file_hash,
    target_format,
    aws_account_id,
	aws_region,
    cast(duration as double) as avg_duration
    FROM "centralized"."logs"
    WHERE step_key LIKE '%end%' AND client_name = 'Example Corp'
    ORDER BY client_name, process ASC
    """
    return execute_query(query)


def wait_for_query_to_complete(query_execution_id):
    """
    Poll Athena to check if the query is in a SUCCEEDED state.
    """
    while True:
        response = client.get_query_execution(QueryExecutionId=query_execution_id)
        state = response["QueryExecution"]["Status"]["State"]

        if state == "SUCCEEDED":
            return
        elif state in ["FAILED", "CANCELLED"]:
            raise Exception(f"Athena query {query_execution_id} failed or was cancelled.")
        time.sleep(2)


def execute_query(query):
    try:
        query_execution_id = client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={
                'Database': ATHENA_DATABASE
            },
            ResultConfiguration={"OutputLocation": ATHENA_OUTPUT_S3_URI},
            WorkGroup=ATHENA_WORKGROUP,
        )["QueryExecutionId"]

        # Wait for the query to complete
        wait_for_query_to_complete(query_execution_id)

        # Get the result set
        result = client.get_query_results(QueryExecutionId=query_execution_id)
        # Extract the header names
        headers = [col['VarCharValue'] for col in result['ResultSet']['Rows'][0]['Data']]
        # Initialize a dictionary to store your data
        # Initialize a list to store each row as a dictionary
        data_list = []

        # Process each row in the result set, skipping the first row (header row)
        for row in result['ResultSet']['Rows'][1:]:  # Start from 1 to skip headers
            row_data = {}
            for idx, col in enumerate(row['Data']):
                # Handle potential missing 'VarCharValue' in columns safely
                row_data[headers[idx]] = col.get('VarCharValue', None)  # None if 'VarCharValue' is not present
            data_list.append(row_data)

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(data_list)
        }

        # For simplicity, just returning the query execution ID

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
