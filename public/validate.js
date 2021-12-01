document.addEventListener('DOMContentLoaded', main);

function main(){
    console.log("loading javascript");
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }

          form.classList.add('was-validated')
        }, false)
      })

    let imagesPreview = function(input, placeToInsertImagePreview) {
      if (input.files) {
        let filesAmount = input.files.length;
        for (i = 0; i < filesAmount; i++) {
          let reader = new FileReader();
          reader.onload = function(event) {
            $($.parseHTML("<img>"))
              .attr("src", event.target.result)
              .appendTo(placeToInsertImagePreview);
          };
          reader.readAsDataURL(input.files[i]);
        }
      }
    };
    $("#input-files").on("change", function() {
      imagesPreview(this, "div.preview-images");
    });
}

