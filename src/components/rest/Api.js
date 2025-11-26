import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import "./Api.scss";

const RequestSchema = ({ schema, indentLevel = 0 }) => {
  const properties = schema.properties || null;

  const style = {
    marginLeft: `${indentLevel * 20}px`,
    display: "table",
    maxWidth: "100%",
  };
  if (indentLevel > 0) {
    style.marginBottom = "0px";
  }

  const getType = (field) => {
    if (Array.isArray(properties[field].type)) {
      if (properties[field].enum) {
        return `${properties[field].type.join(" or ")} (${properties[field].enum
          .map((v) => {
            return typeof v === "string" ? `'${v}'` : v;
          })
          .join(", ")})`;
      }
      return properties[field].type.join(" or ");
    } else if (properties[field].type === "array") {
      if (properties[field].items.type) {
        return `array of ${properties[field].items.type}`;
      } else {
        return "array";
      }
    } else if (properties[field].type === "object") {
      return "object";
    } else if (properties[field].pattern) {
      return `string (${properties[field].pattern})`;
    } else if (properties[field].enum) {
      return `${properties[field].type} (${properties[field].enum.join(", ")})`;
    } else {
      return properties[field].type;
    }
  };

  if (!properties) {
    if (indentLevel === 0) {
      return <i>No request body required</i>;
    } else {
      return null;
    }
  }
  return (
    <table style={style} className="not-prose table-auto">
      <thead>
        <tr>
          <th className="text-left">Field Name</th>
          <th className="text-left">Field Type</th>
          <th className="text-left">Required</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(properties).map((field) => (
          <React.Fragment key={field}>
            <tr>
              <td>{field}</td>
              <td>{getType(field)}</td>
              <td>
                {schema.required && schema.required.includes(field)
                  ? "Yes"
                  : "No"}
              </td>
            </tr>
            {properties[field].type === "object" && (
              <tr>
                <td colSpan={3}>
                  <RequestSchema
                    schema={properties[field]}
                    indentLevel={indentLevel + 1}
                  />
                </td>
              </tr>
            )}
            {properties[field].type === "array" &&
              properties[field].items.type === "object" && (
                <tr>
                  <td colSpan={3} align="right">
                    <RequestSchema
                      schema={properties[field].items}
                      indentLevel={indentLevel + 1}
                    />
                  </td>
                </tr>
              )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default function Api({
  method,
  url,
  requestSchema = `{}`,
  responseSample,
  isPrivate = true,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <div>
          <div className="flex gap-2 justify-start pb-3">
            <b>Request Schema (application/json)</b>
          </div>
          {requestSchema && <RequestSchema schema={requestSchema} />}
        </div>
      </div>
      <div className="w-full">
        <div className="border rounded-md border-gray-300 p-3 w-full">
          <div className=" pb-2 flex gap-2 justify-start items-center">
            <span className={`method ${method}`}>{method}</span>
            <span className="url">{url}</span>
          </div>
          <Tabs>
            <TabItem value="curl" label="cURL">
              {isPrivate ? (
                <CodeBlock language="jsx" showLineNumbers>
                  {`curl
  -H "Accept: application/json"
  -H "Authorization: Bearer <admin JWT token>"${
    method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH"
      ? "\n  --data-raw '<JSON DATA>'"
      : ""
  }
  https://<your domain>${url}
`}
                </CodeBlock>
              ) : (
                <CodeBlock language="jsx" showLineNumbers>
                  {`curl
  -H "Accept: application/json"${
    method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH"
      ? '\n  --data-raw "<JSON DATA>"'
      : ""
  }
  https://<your domain>${url}
`}
                </CodeBlock>
              )}
            </TabItem>
            <TabItem value="js" label="JavaScript">
              {isPrivate ? (
                <CodeBlock language="jsx" showLineNumbers>
                  {`fetch('https://<your domain>${url}', {
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer <admin JWT token>'
  }${
    method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH"
      ? ",\n  body: <JSON DATA>"
      : ""
  }
})
  .then(response => response.json())
  .then(data => {
    if(data.error) {
      // Handle the error
    } else {
      // Handle the data
    }
  })
  .catch(error => {
    // Handle the error
  });
`}
                </CodeBlock>
              ) : (
                <CodeBlock language="jsx" showLineNumbers>
                  {`fetch('https://<your domain>${url}', {
  headers: {
    'Accept': 'application/json',
  }${
    method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH"
      ? ",\n  body: <JSON DATA>"
      : ""
  }
})
  .then(response => response.json())
  .then(data => {
    if(data.error) {
      // Handle the error
    } else {
      // Handle the data
    }
  })
  .catch(error => {
    // Handle the error
  });
`}
                </CodeBlock>
              )}
            </TabItem>
          </Tabs>
          <div className="mt-5">
            <div>
              <div className="flex gap-2 justify-start pb-3">
                <b>Sample Of Response</b>
              </div>
              <CodeBlock language="jsx" showLineNumbers>
                {responseSample}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
