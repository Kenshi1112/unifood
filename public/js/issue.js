document.getElementById('issueForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const token = localStorage.getItem('token');
  const resDiv = document.getElementById('issueResult');
  resDiv.textContent = '';

  try {
    const response = await fetch('/api/issue', {
      method: 'POST',
      headers: {
        'Authorization': token ? 'Bearer ' + token : ''
      },
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      resDiv.textContent = 'ส่งแจ้งปัญหาเรียบร้อยแล้ว!';
      form.reset();
    } else {
      resDiv.textContent = data.error || 'เกิดข้อผิดพลาด';
    }
  } catch (err) {
    resDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
  }
});
