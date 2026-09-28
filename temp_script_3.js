
window.alert = function(message) {
    Swal.fire({
        text: message,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#2b3a67',
        allowOutsideClick: false
    });
};
