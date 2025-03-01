import axios from 'axios';
async function handleIndexPage () {
  // const res = await axios.get('https://4apz632vpan4f5u2unyg75kury0jvrzm.lambda-url.us-east-1.on.aws/?json=1');
  // console.log(res.data);
  const data = [{"avg_duration":"181.86266152064005","process":"lambda-profile","aws_account_id":"122610477593","aws_region":"us-east-1","count":"3","latest_timestamp":"2025-02-28 14:09:57.131","client_name":"Example Corp"},{"avg_duration":"23.995896339416504","process":"lambda-stage","aws_account_id":"122610477593","aws_region":"us-east-1","count":"4","latest_timestamp":"2025-02-28 14:04:55.395","client_name":"Example Corp"}];
  const template = document.getElementById('clientRowTemplate').innerHTML;
  const tbody = document.querySelector('#clientTable tbody');

  data.forEach(item => {
      let row = template;
      row = row.replaceAll('{{client_name}}', item.client_name);
      row = row.replace('{{process}}', item.process);
      row = row.replace('{{avg_duration}}', item.avg_duration);
      row = row.replace('{{aws_region}}', item.aws_region);
      row = row.replace('{{aws_account_id}}', item.aws_account_id);
      row = row.replace('{{count}}', item.count);
      row = row.replace('{{latest_timestamp}}', item.latest_timestamp);
      tbody.insertAdjacentHTML('beforeend', row);
  });
}
async function init () {
  if (document.getElementById('clientRowTemplate')) handleIndexPage();
  
}
document.addEventListener('DOMContentLoaded', init);
