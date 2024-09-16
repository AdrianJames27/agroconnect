// modal.js

function createEditModal() {
    $('#edit').append(`
      <!-- Edit Modal -->
      <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editModalLabel">Confirm Edit</h5>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to edit this <span id='dataEdit'>user</span>?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal" id="cancelEdit">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirmEditBtn">Edit</button>
            </div>
          </div>
        </div>
      </div>
    `);
  }
  